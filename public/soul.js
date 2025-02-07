// const socket = io("http://192.168.1.228:3000"); // Replace with actual domain when deployed
// server.listen(3000, "0.0.0.0", () => {
//     console.log("Server running on http://192.168.1.228:3000");
// });
// const socket = io(); // Automatically connects to the correct server

const socket = io("https://btw-production.up.railway.app/");
// const socket =io("http://192.168.1.228:3000")
let signature = $("#signature");
let toggle = $(".toggle");
let close = $("#close");

let tlContentIn = new TimelineMax({
	onComplete: function() {}
});

function init() {
	TweenMax.set(signature, { x: "100%", right: 0, opacity: 0 });
}

function animateToggleOut() {
	TweenMax.to(toggle, 0.1, { x: "+=2", yoyo: true, repeat: 6 });
	TweenMax.to(toggle, 0.1, { x: "-=2", yoyo: true, repeat: 6 });
	TweenMax.to(toggle, 1.25, {
		ease: Power4.easeIn,
		bottom: "105vh",
		onStart: function() {
			openPanel();
		}
	});
}

function animateToggleIn() {
	TweenMax.set(toggle, { bottom: "105vh", opacity: 1 });
	TweenMax.to(toggle, 0.1, { x: "+=2", delay: 0.4, yoyo: true, repeat: 6 });
	TweenMax.to(toggle, 0.1, { x: "-=2", delay: 0.4, yoyo: true, repeat: 6 });
	TweenMax.to(toggle, 1.5, { ease: Power4.easeOut, bottom: "-4%" });
}

function openPanel() {
	TweenMax.fromTo(
		signature,
		0.3,
		{ x: "100%" },
		{ x: "0%", opacity: 1, delay: 1.2, onStart: function(){
		contentIn();
	} }
	);
}

function closePanel() {
	TweenMax.to(signature, 0.3, {
		x: "100%",
		opacity: 0,
		onStart: function() {
			animateToggleIn();
		}
	});
}

function closeMouseIn() {
	TweenMax.set($("#close_1, #close_2"), {
		rotation: 0,
		transformOrigin: "50% 50%"
	});

	TweenMax.to($("#close_1"), 0.5, { rotation: "180deg" });
	TweenMax.to($("#close_2"), 0.5, { rotation: "-180deg" });
}

function closeMouseOut() {
	TweenMax.set(close, { rotation: "0deg" });
	TweenMax.to(close, 0.3, { rotation: "360deg" });
}


function contentIn() {
	TweenMax.set($(".icon, .links, #signature h2, #signature p"), {opacity: 0, y: -30});
	TweenMax.to($(".icon"), 0.2, {opacity: 1, delay: 0.2, y: 0});
			TweenMax.to($("#signature h2"), 0.2, {opacity: 1, delay: 0.4, y: 0});
	
		TweenMax.to($(".links"), 0.2, {opacity: 1, delay: 0.6, y: 0});
	
			TweenMax.to($("#signature p"), 0.2, {opacity: 1, delay: 0.8, y: 0});
	
	TweenMax.to($("#signature p svg"), 2, {scale: 0.9, ease:Elastic.easeOut, repeat: -1})
	
	
}





document.addEventListener("DOMContentLoaded", function () {
    let desktopIcons = document.querySelectorAll("#Desktop .icon");
    let secretFolders = document.querySelectorAll("#secrets .icon");
    let crosswordTiles = document.querySelectorAll("#cwrd input");
    let openWindows = [];
    let unlockedRows = new Set(); // Tracks unlocked crossword rows
    let openedWindows = new Set(); // Tracks already opened folders
    let unlockNotification = document.getElementById("unlock-notification");

    // Function to bring a window to the top
    function bringToFront(el) {
        openWindows.forEach(win => win.style.zIndex = 1000);
        el.style.zIndex = 2000;
    }

    // Function to make windows draggable
// Function to make windows draggable (supports touch & mouse)
function makeDraggable(el) {
    let isDragging = false, offsetX, offsetY;

    function startDrag(e) {
        isDragging = true;
        let clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
        let clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - el.getBoundingClientRect().left;
        offsetY = clientY - el.getBoundingClientRect().top;
        bringToFront(el);
    }

    function moveDrag(e) {
        if (isDragging) {
            let clientX = e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
            let clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
            el.style.left = clientX - offsetX + "px";
            el.style.top = clientY - offsetY + "px";
        }
    }

    function stopDrag() {
        isDragging = false;
    }

    el.addEventListener("mousedown", startDrag);
    el.addEventListener("touchstart", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("touchmove", moveDrag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchend", stopDrag);
}

    // Function to create a unique window per icon
    function createWindow(title, content, files) {
        let windowDiv = document.createElement("div");
        windowDiv.classList.add("desktop-window");

        // Convert file list JSON into HTML list
        let fileList = JSON.parse(files).map(file => `
            <li data-description="${file.description}">
                <img src="${file.icon}" alt="${file.name}">
                <span>${file.name}</span>
            </li>
        `).join("");

        windowDiv.innerHTML = `
            <div class="window-header">${title} <span class="close-btn">✖</span></div>
            <div class="window-content">${content}</div>
            <ul class="window-menu">${fileList}</ul>
            <div class="window-footer"></div>
        `;

        // Position randomly on screen
        windowDiv.style.position = "absolute";
        windowDiv.style.top = Math.random() * 300 + "px";
        windowDiv.style.left = Math.random() * 500 + "px";

        document.body.appendChild(windowDiv);
        openWindows.push(windowDiv);
        makeDraggable(windowDiv);
        bringToFront(windowDiv);

        // Close window event
        windowDiv.querySelector(".close-btn").addEventListener("click", function () {
            windowDiv.remove();
            openWindows = openWindows.filter(win => win !== windowDiv);
            openedWindows.delete(title); // Allow reopening after window is closed
        });

        // Handle file clicks
        let menuItems = windowDiv.querySelectorAll(".window-menu li");
        menuItems.forEach(item => {
            item.addEventListener("click", function () {
                let footer = windowDiv.querySelector(".window-footer");
                footer.innerHTML = `<p>${item.getAttribute("data-description")}</p>`;
                footer.style.display = "block";
            });
        });
    }

    // Handle double-click on desktop icons
	let openedDesktopWindows = new Set(); // Track opened Desktop folder windows

	// Handle double-click on Desktop icons (ensure only one instance at a time, allow reopening)
		// desktopIcons.forEach(folder => {
		// 	let clickCount = 0;
		// 	let folderTitle = folder.getAttribute("data-title");
	
		// 	folder.addEventListener("click", function () {
		// 		if (!folder.classList.contains("locked")) {
		// 			clickCount++;
	
		// 			setTimeout(() => {
		// 				if (clickCount === 2) {
		// 					if (!openedWindows.has(folderTitle)) {
		// 						let title = folder.getAttribute("data-title");
		// 						let content = folder.getAttribute("data-content");
		// 						let files = folder.getAttribute("data-files");
		// 						createWindow(title, content, files);
		// 						openedWindows.add(folderTitle); // Mark folder as opened
		// 					}
		// 				}
		// 				clickCount = 0; // Reset click count
		// 			}, 300);
		// 		}
		// 	});
		// });

        desktopIcons.forEach(icon => {
            let folderTitle = icon.getAttribute("data-title");
        
            icon.addEventListener("click", function () {
                if (!openedWindows.has(folderTitle)) {
                    let title = icon.getAttribute("data-title");
                    let content = icon.getAttribute("data-content");
                    let files = icon.getAttribute("data-files");
                    createWindow(title, content, files);
                    openedWindows.add(folderTitle); // Mark folder as opened
                }
            });
        });

		

    // Function to show unlock notification
    function showUnlockNotification(message) {
        unlockNotification.innerText = message;
        unlockNotification.style.display = "block";
        setTimeout(() => {
            unlockNotification.style.display = "none";
        }, 2000);
    }

    // // Function to check if the full word is entered correctly before unlocking
    // function checkWordCompletion(rowIndex) {
    //     let rowTiles = document.querySelectorAll(`.crossword-row input[data-row="${rowIndex}"]`);
    //     let expectedAnswer = Array.from(rowTiles).map(t => t.dataset.answer.toUpperCase()).join("");
    //     let userAnswer = Array.from(rowTiles).map(t => t.value.toUpperCase()).join("");

    //     // Ensure the user has filled out all letters before checking
    //     let allFilled = Array.from(rowTiles).every(tile => tile.value.length > 0);
    //     let folderToUnlock = document.querySelector(`#secrets .icon[data-row="${rowIndex}"]`);

    //     if (allFilled && userAnswer === expectedAnswer) {
    //         // Unlock folder
    //         folderToUnlock.classList.remove("locked");
    //         folderToUnlock.classList.add("unlocked");
    //         folderToUnlock.style.opacity = "1";
    //         folderToUnlock.style.pointerEvents = "auto";

    //         // Show unlock notification
    //         let folderTitle = folderToUnlock.getAttribute("data-title");
    //         showUnlockNotification(`Folder "${folderTitle}" is now unlocked!`);

    //         // Auto-focus on the next crossword row
    //         let nextRowTiles = document.querySelectorAll(`.crossword-row input[data-row="${parseInt(rowIndex) + 1}"]`);
    //         if (nextRowTiles.length > 0) {
    //             nextRowTiles[0].focus();
    //         }
    //     } else {
    //         // Lock the folder again if word is incomplete or incorrect
    //         folderToUnlock.classList.add("locked");
    //         folderToUnlock.classList.remove("unlocked");
    //         folderToUnlock.style.opacity = "0.5";
    //         folderToUnlock.style.pointerEvents = "none";
    //     }
    // }

    function checkWordCompletion(rowIndex) {
        let rowTiles = document.querySelectorAll(`.crossword-row input[data-row="${rowIndex}"]`);
        let expectedAnswer = Array.from(rowTiles).map(t => t.dataset.answer.toUpperCase()).join("");
        let userAnswer = Array.from(rowTiles).map(t => t.value.toUpperCase()).join("");
    
        // Ensure the user has filled out all letters before checking
        let allFilled = Array.from(rowTiles).every(tile => tile.value.length > 0);
        let folderToUnlock = document.querySelector(`#secrets .icon[data-row="${rowIndex}"]`);
    
        if (!folderToUnlock) {
            console.warn(`No folder found for rowIndex: ${rowIndex}`);
            return; // Exit if no matching folder exists
        }
    
        if (allFilled && userAnswer === expectedAnswer) {
            // Unlock folder
            folderToUnlock.classList.remove("locked");
            folderToUnlock.classList.add("unlocked");
            folderToUnlock.style.opacity = "1";
            folderToUnlock.style.pointerEvents = "auto";
    
            // Show unlock notification
            let folderTitle = folderToUnlock.getAttribute("data-title");
            showUnlockNotification(`Folder "${folderTitle}" is now unlocked!`);
    
            // Auto-focus on the next crossword row
            let nextRowTiles = document.querySelectorAll(`.crossword-row input[data-row="${parseInt(rowIndex) + 1}"]`);
            if (nextRowTiles.length > 0) {
                nextRowTiles[0].focus();
            }
        } else {
            // Lock the folder again if word is incomplete or incorrect
            folderToUnlock.classList.add("locked");
            folderToUnlock.classList.remove("unlocked");
            folderToUnlock.style.opacity = "0.5";
            folderToUnlock.style.pointerEvents = "none";
        }
    }

    // Listen for input changes on crossword tiles
    crosswordTiles.forEach((tile) => {
        tile.addEventListener("input", function () {
            let rowIndex = tile.dataset.row;
            checkWordCompletion(rowIndex);
        });
    });
	
	// Listen for input and check full word
// // Define words and their corresponding folders
// const words = [
//     { id: "bored", answer: "BORED", row: 0 },
//     { id: "obsession", answer: "OBSESSION", row: 1 },
//     { id: "coding", answer: "CODING", row: 2 },
//     { id: "lifestyle", answer: "LIFESTYLE", row: 3 },
//     { id: "careful", answer: "CAREFUL", row: 4 }
// ];

// // Function to check input and unlock folders
// words.forEach(word => {
//     document.getElementById(word.id).addEventListener("input", function () {
//         let inputVal = this.value.toUpperCase();

//         if (inputVal.length === word.answer.length && inputVal === word.answer) {
//             let folderToUnlock = document.querySelector(`#secrets .icon[data-row="${word.row}"]`);
//             if (folderToUnlock) {
//                 folderToUnlock.classList.remove("locked");
//                 folderToUnlock.classList.add("unlocked");
//                 folderToUnlock.style.opacity = "1";
//                 folderToUnlock.style.pointerEvents = "auto";

//                 // Show unlock notification
//                 showUnlockNotification(`Folder "${folderToUnlock.getAttribute("data-title")}" is now unlocked!`);
//             }
//         } else {
//             // Lock the folder again if the input is incorrect or deleted
//             let folderToLock = document.querySelector(`#secrets .icon[data-row="${word.row}"]`);
//             if (folderToLock) {
//                 folderToLock.classList.add("locked");
//                 folderToLock.classList.remove("unlocked");
//                 folderToLock.style.opacity = "0.5";
//                 folderToLock.style.pointerEvents = "none";
//             }
//         }
//     });
// });

// // Function to show unlock notification
// function showUnlockNotification(message) {
//     let unlockNotification = document.getElementById("unlock-notification");
//     unlockNotification.innerText = message;
//     unlockNotification.style.display = "block";
//     setTimeout(() => {
//         unlockNotification.style.display = "none";
//     }, 2000);
// }


//socket io guesses
// Define words and their corresponding folders
const words = [
    { id: "bored", answer: "BORED", row: 0 },
    { id: "obsession", answer: "OBSESSION", row: 1 },
    { id: "coding", answer: "CODING", row: 2 },
    { id: "lifestyle", answer: "LIFESTYLE", row: 3 },
    { id: "careful", answer: "CAREFUL", row: 4 }
];

// Function to check input and unlock folders
words.forEach(word => {
    let inputField = document.getElementById(word.id);

    inputField.addEventListener("input", function () {
        let inputVal = this.value.toUpperCase();

        if (inputVal.length === word.answer.length && inputVal === word.answer) {
            socket.emit("wordSolved", { wordId: word.id, word: word.answer }); // Send to server
        }
    });
});

// Listen for real-time updates from the server
socket.on("updateSolvedWords", (solvedWords) => {
    Object.keys(solvedWords).forEach(wordId => {
        let folderToUnlock = document.querySelector(`#secrets .icon[data-row="${words.find(w => w.id === wordId).row}"]`);
        if (folderToUnlock) {
            folderToUnlock.classList.remove("locked");
            folderToUnlock.classList.add("unlocked");
            folderToUnlock.style.opacity = "1";
            folderToUnlock.style.pointerEvents = "auto";

            // Disable the crossword input once solved
            let inputField = document.getElementById(wordId);
            inputField.value = solvedWords[wordId]; 
            inputField.disabled = true;

            // Show unlock notification
            showUnlockNotification(`"${solvedWords[wordId]}" has been solved! Folder unlocked.`);
        }
    });
});

    // Ensure secret folders require a double-click and can only be opened once
    // secretFolders.forEach(folder => {
    //     let clickCount = 0;
    //     let folderTitle = folder.getAttribute("data-title");

    //     folder.addEventListener("click", function () {
    //         if (!folder.classList.contains("locked")) {
    //             clickCount++;

    //             setTimeout(() => {
    //                 if (clickCount === 2) {
    //                     if (!openedWindows.has(folderTitle)) {
    //                         let title = folder.getAttribute("data-title");
    //                         let content = folder.getAttribute("data-content");
    //                         let files = folder.getAttribute("data-files");
    //                         createWindow(title, content, files);
    //                         openedWindows.add(folderTitle); // Mark folder as opened
    //                     }
    //                 }
    //                 clickCount = 0; // Reset click count
    //             }, 300);
    //         }
    //     });
    // });

    secretFolders.forEach(folder => {
        let folderTitle = folder.getAttribute("data-title");
    
        folder.addEventListener("click", function () {
            if (!folder.classList.contains("locked") && !openedWindows.has(folderTitle)) {
                let title = folder.getAttribute("data-title");
                let content = folder.getAttribute("data-content");
                let files = folder.getAttribute("data-files");
                createWindow(title, content, files);
                openedWindows.add(folderTitle); // Mark folder as opened
            }
        });
    });

    // Make crossword puzzle draggable
    let crosswordDiv = document.querySelector("#cwrd");
    makeDraggable(crosswordDiv);

	
});