import { Router, type Response } from 'express';
import Address from '../models/Address.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET all addresses for the logged-in user
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving addresses.', error: error.message });
  }
});

// POST create a new address
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;
    if (!fullName || !phone || !street || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All address fields are required.' });
    }

    const defaultFlag = !!isDefault;

    // If setting as default, clear existing defaults for this user
    if (defaultFlag) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // Check if user has no addresses. If so, make this one default
    const count = await Address.countDocuments({ user: req.user._id });
    const isFirstAddress = count === 0;

    const address = new Address({
      user: req.user._id,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      isDefault: isFirstAddress ? true : defaultFlag
    });

    await address.save();
    res.status(201).json(address);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding address.', error: error.message });
  }
});

// PUT update an existing address
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

    if (!address) {
      return res.status(404).json({ message: 'Address not found or unauthorized.' });
    }

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;

    if (isDefault !== undefined) {
      const defaultFlag = !!isDefault;
      if (defaultFlag && !address.isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
        address.isDefault = true;
      } else if (!defaultFlag) {
        address.isDefault = false;
      }
    }

    await address.save();
    res.json(address);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating address.', error: error.message });
  }
});

// DELETE an address
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found or unauthorized.' });
    }

    // If deleted address was default, make the next most recent address the default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({ message: 'Address deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting address.', error: error.message });
  }
});

// PUT set default address
router.put('/:id/default', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ message: 'Address not found or unauthorized.' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.json(address);
  } catch (error: any) {
    res.status(500).json({ message: 'Error setting default address.', error: error.message });
  }
});

export default router;
