chrome.tabs.create(
	{ pinned: true, active: false, url: `chrome-extension://${chrome.runtime.id}/popup.html` },
	() => {}
);