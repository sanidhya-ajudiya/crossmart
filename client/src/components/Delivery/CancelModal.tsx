import '../../delivery.css';

interface CancelModalProps {
    setCancelModal: (cancelModal: string | null) => void;
    cancelReason: string;
    setCancelReason: (cancelReason: string) => void;
    handleCancel: () => void;
    submitting: boolean;
}

export default function CancelModal({
    setCancelModal,
    cancelReason,
    setCancelReason,
    handleCancel,
    submitting,
}: CancelModalProps) {

    const handleBack = () => {
        setCancelModal(null);
        setCancelReason('');
    };

    return (
        <>
            {/* ── Backdrop ─────────────────────────────────────── */}
            <div className="cnl-backdrop" onClick={handleBack} />

            {/* ── Centering wrapper ─────────────────────────────── */}
            <div className="cnl-wrapper">
                <div className="cnl-dialog">

                    {/* Title */}
                    <h3 className="cnl-title">Cancel Delivery</h3>

                    {/* Description */}
                    <p className="cnl-desc">Please provide a reason for cancellation.</p>

                    {/* Reason textarea */}
                    <textarea rows={3} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason..." className="cnl-textarea"/>

                    {/* Action buttons */}
                    <div className="cnl-btn-row">
                        {/* Back */}
                        <button className="cnl-btn cnl-btn-back" onClick={handleBack}>Back</button>

                        {/* Confirm Cancel */}
                        <button className="cnl-btn cnl-btn-confirm" onClick={handleCancel} disabled={submitting}> {submitting ? 'Cancelling…' : 'Confirm Cancel'} </button>
                    </div>
                </div>
            </div>
        </>
    );
}
