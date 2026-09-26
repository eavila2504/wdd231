// Importing main.js runs its shared init (footer meta, nav toggle, theme toggle)
// automatically — don't call those functions again here, or every click would
// fire twice (e.g. the theme toggle would flip on and back off in one click).
import './main.js';

// ---------- Hidden timestamp: set when the form loads ----------
const timestampField = document.getElementById('timestamp');
if (timestampField) {
    timestampField.value = new Date().toString();
}

// ---------- Membership modals ----------
document.querySelectorAll('.membership-link').forEach((btn) => {
    btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.modal);
        if (modal) modal.showModal();
    });
});

document.querySelectorAll('.membership-modal').forEach((dialog) => {
    const closeBtn = dialog.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => dialog.close());
    }
    // Click on the ::backdrop (outside the modal content) also closes it.
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
    });
});