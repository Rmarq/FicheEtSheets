document.addEventListener("DOMContentLoaded", function () {
    let draggedBox = null;

    document.querySelectorAll(".box-drag").forEach((box) => {
        console.log("box name = " + box.getAttribute("data-box-id"));
        box.addEventListener("dragstart", function (event) {
            console.log("dragstart");
            draggedBox = this;
            console.log("this.getAttribute(data-box-id) = " + this.getAttribute("data-box-id"));
            event.dataTransfer.setData("text/plain", this.getAttribute("data-box-id"));
        });

        box.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        box.addEventListener("drop", function (event) {
            event.preventDefault();
            let draggedBoxId = event.dataTransfer.getData("text/plain");
            let targetBoxId = this.getAttribute("data-box-id");
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
        });
    });
});
