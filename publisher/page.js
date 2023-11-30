class Page {
    constructor() {
        this.publisher = new Publisher();
        this.publisherID = document.getElementById("publisherID");
        this.publisherVideo = document.getElementById("publisherVideo");
        this.publisherVideoCheckbox = document.getElementById("publisherVideoCheckbox");
        this.publisherAudioCheckbox = document.getElementById("publisherAudioCheckbox");
        this.publisherDataCheckbox = document.getElementById("publisherDataCheckbox");
        this.publisherVideoStats = document.getElementById("publisherVideoStats");
        this.publisherAudioStats = document.getElementById("publisherAudioStats");
        this.publisherDataStats = document.getElementById("publisherDataStats");
        this.errorBox = document.getElementById("errorBox");

        this.publisherText = document.getElementById("publisherText");
        this.publisherText.addEventListener("keydown", (event) => { if (event.key === "Enter") this.sendMessage(); })

        this.startButton = document.getElementById("startButton");
        this.startButton.addEventListener("click", () => { this.start(); })
    }

    async start() {
        try {
            const video = this.publisherVideoCheckbox.checked;
            const audio = this.publisherAudioCheckbox.checked;
            const data = this.publisherDataCheckbox.checked;

            if (!video && !audio && !data) {
                throw "Error: at least one of video, audio, and data must be selected"
            }

            await this.publisher.publish(video, audio, data);
            this.publisherVideo.srcObject = this.publisher.stream;
            if (data) this.publisherText.disabled = false;
            this.startButton.disabled = true;
            this.publisherVideoCheckbox.disabled = true;
            this.publisherAudioCheckbox.disabled = true;
            this.publisherDataCheckbox.disabled = true;
            this.publisherID.value = this.publisher.id;
            this.showStats();
            this.errorBox.innerText = "";
        } catch (error) {
            this.errorBox.innerText = error;
        }
    }

    async sendMessage() {
        try {
            let message = this.publisherText.value;
            this.publisher.sendMessage(message);
            this.publisherText.value = "";
            this.publisherText.placeholder = `sent ${message}`;
            this.errorBox.innerText = "";
        } catch (error) {
            this.errorBox.innerText = error;
        }
    }

    async showStats() {
        setInterval(async () => {
            if (this.publisherVideoCheckbox.checked) this.publisher.getStats("video").then((stats) => this.publisherVideoStats.innerText = stats);
            if (this.publisherAudioCheckbox.checked) this.publisher.getStats("audio").then((stats) => this.publisherAudioStats.innerText = stats);
        }, 1000);
    }
}

const page = new Page();