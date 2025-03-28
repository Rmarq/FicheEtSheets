document.addEventListener("DOMContentLoaded", function () {
    let draggedBox = null;
    let ghostBox = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let boxStartX = 0;
    let boxStartY = 0;
    let isDragging = false;

    document.querySelectorAll(".box-drag").forEach((box) => {
        console.log("box name = " + box.getAttribute("data-box-id"));

        // Disable long-press context menu
        box.addEventListener("contextmenu", (event) => event.preventDefault());

        // Mouse-based drag and drop
        box.addEventListener("dragstart", function (event) {
            draggedBox = this;
            event.dataTransfer.setData("text/plain", this.getAttribute("data-box-id"));
        });

        box.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        box.addEventListener("drop", function (event) {
            console.log("DEBUG drop");
            event.preventDefault();
            handleDrop(event, this);
        });

        // Touch-based drag and drop for mobile
        box.addEventListener("touchstart", function (event) {
            isDragging = false; // Reset drag state
            draggedBox = this;
        });

        box.addEventListener("touchmove", function (event) {
            isDragging = true;
            event.preventDefault(); // Prevent scrolling while dragging


            // Create the ghost box
            
            if (ghostBox) {
                let touchX = event.touches[0].clientX;
                let touchY = event.touches[0].clientY;
                moveGhostBox(touchX, touchY);
            } else {
                touchStartX = event.touches[0].clientX;
                touchStartY = event.touches[0].clientY;
                createGhostBox(draggedBox, touchStartX, touchStartY);
            }
        });

        box.addEventListener("touchend", function (event) {
            if (ghostBox) {
                document.body.removeChild(ghostBox);
                ghostBox = null;
            }

            if (!isDragging) {
                window.location.href = this.getAttribute("href");
                return;
            }

            let touchEndX = event.changedTouches[0].clientX;
            let touchEndY = event.changedTouches[0].clientY;

            let target = document.elementFromPoint(touchEndX, touchEndY);
            while (target && !target.classList.contains("box-drag")) {
                target = target.parentElement;
            }

            if (target && target !== draggedBox) {
                handleDrop(event, target);
            }
        });

        function handleDrop(event, targetBox) {
            let draggedBoxId = draggedBox.getAttribute("data-box-id");
            let targetBoxId = targetBox.getAttribute("data-box-id") || 0;
            console.log("draggedBoxId = " + draggedBoxId + ", targetBoxId = " + targetBoxId);

            if (draggedBoxId !== targetBoxId) {
                fetch(`/moveBox/${draggedBoxId}/${targetBoxId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert("Failed to move the box.");
                    }
                });
            }
        }

        function createGhostBox(originalBox, x, y) {
            ghostBox = originalBox.cloneNode(true);
            ghostBox.style.position = "absolute";
            ghostBox.style.width = `${originalBox.offsetWidth}px`;
            ghostBox.style.height = `${originalBox.offsetHeight}px`;
            ghostBox.style.opacity = "0.7";
            ghostBox.style.pointerEvents = "none"; // Prevent interactions
            ghostBox.style.zIndex = "1000";
            ghostBox.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            ghostBox.style.border = "1px solid #ccc";
            ghostBox.style.borderRadius = "5px";
            document.body.appendChild(ghostBox);
            boxStartX = ghostBox.offsetLeft;
            boxStartY = ghostBox.offsetTop;
            moveGhostBox(x, y);
        }

        function moveGhostBox(x, y) {
            x = x - boxStartX;
            y = y - boxStartY;
            ghostBox.style.transform = `translate(${x}px, ${y}px)`;
        }
    });
});
