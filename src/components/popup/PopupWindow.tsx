import './PopupWindow.css'
type Props = {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PopupWindow({ open, message, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="backdrop">
      <div className="pop-up-window">
        <p>{message}</p>

        <div className="actions">
          <button className="btn confirm" onClick={onConfirm}>
            Yes
          </button>

          <button className="btn cancel" onClick={onCancel}>
            Cancel
          </button>

        </div>
      </div>
    </div>
  );
}