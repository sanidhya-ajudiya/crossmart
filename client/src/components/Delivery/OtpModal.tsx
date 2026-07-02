import '../../delivery.css';

interface OtpModalProps {
    setOtpModal: (otpModal: string | null) => void;
    otp: string;
    setOtp: (otp: string) => void;
    handleComplete: () => void;
    submitting: boolean;
}

export default function OtpModal({
    setOtpModal,
    otp,
    setOtp,
    handleComplete,
    submitting,
}: OtpModalProps) {

    const handleCancel = () => {
        setOtpModal(null);
        setOtp('');
    };

    return (
        <>
            {/* ── Backdrop ─────────────────────────────────────── */}
            <div className="otp-backdrop" onClick={handleCancel} />

            {/* ── Centering wrapper ─────────────────────────────── */}
            <div className="otp-wrapper">
                <div className="otp-dialog">

                    {/* Title */}
                    <h3 className="otp-title">Enter Delivery OTP</h3>

                    {/* Description */}
                    <p className="otp-desc">Ask the customer for the 6-digit OTP shown on their tracking page.</p>

                    {/* OTP input */}
                    <input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000" className={`otp-input${otp.length === 6 ? ' otp-input--filled' : ''}`} />

                    {/* Action buttons */}
                    <div className="otp-btn-row">
                        {/* Cancel */}
                        <button className="otp-btn otp-btn-cancel" onClick={handleCancel}>Cancel</button>

                        {/* Confirm */}
                        <button className="otp-btn otp-btn-confirm" onClick={handleComplete} disabled={otp.length !== 6 || submitting}>
                            {submitting ? 'Verifying…' : 'Confirm Delivery'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
