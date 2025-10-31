export default function DevPlaceholder() {
    return (
        <div className="gf-dev">
            <h3>Gistflow Extension</h3>
            <p>This page is only used during local dev. Use the browser extension UI instead:</p>
            <ul>
                <li>Popup: click the toolbar icon</li>
                <li>Sidebar: Popup → Open Sidebar</li>
                <li>Options: chrome://extensions → Gistflow → Details → Extension options</li>
            </ul>
        </div>
    );
}
