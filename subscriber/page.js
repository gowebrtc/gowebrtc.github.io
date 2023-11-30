class Page {
    constructor() {
        this.subscriber = new Subscriber();
        this.subscriberVideo = document.getElementById("subscriberVideo");
        this.subscriberVideoCheckbox = document.getElementById("subscriberVideoCheckbox");
        this.subscriberAudioCheckbox = document.getElementById("subscriberAudioCheckbox");
        this.subscriberDataCheckbox = document.getElementById("subscriberDataCheckbox");
        this.subscriberVideoStats = document.getElementById("subscriberVideoStats");
        this.subscriberAudioStats = document.getElementById("subscriberAudioStats");
        this.subscriberDataStats = document.getElementById("subscriberDataStats");
        this.subscriberText = document.getElementById("subscriberText");
        this.errorBox = document.getElementById("errorBox");

        this.startButton = document.getElementById("startButton");
        this.startButton.addEventListener("click", () => { this.start(); });

        this.publisherID = document.getElementById("publisherID");
        this.publisherID.addEventListener("keydown", (event) => { if (event.key === "Enter") this.watch(); })
    }

    async start() {
        try {
            const video = this.subscriberVideoCheckbox.checked;
            const audio = this.subscriberAudioCheckbox.checked;
            const data = this.subscriberDataCheckbox.checked;

            if (!video && !audio && !data) {
                throw "Error: at least one of video, audio, and data must be selected"
            }

            await this.subscriber.subscribe(video, audio, data);
            this.subscriberVideo.srcObject = this.subscriber.stream;
            this.subscriberVideoCheckbox.disabled = true;
            this.subscriberAudioCheckbox.disabled = true;
            this.subscriberDataCheckbox.disabled = true;
            this.publisherID.disabled = false;
            this.startButton.disabled = true;
            this.subscriber.messageReceiver = this.subscriberText;
            this.showStats();
            this.errorBox.innerText = "";
        } catch (error) {
            this.errorBox.innerText = error;
        }
    }

    async watch() {
        try {
            const publisherID = this.publisherID.value;
            if (publisherID.length == 0) throw "Error: publisher ID cannot be empty";
            await this.subscriber.watch(publisherID)
            this.publisherID.value = "";
            this.publisherID.placeholder = `watching ${publisherID}`;
            this.errorBox.innerText = "";
        } catch (error) {
            this.errorBox.innerText = error;
        }
    }

    async showStats() {
        setInterval(async () => {
            if (this.subscriberVideoCheckbox.checked) this.subscriber.getStats("video").then((stats) => this.subscriberVideoStats.innerText = stats);
            if (this.subscriberAudioCheckbox.checked) this.subscriber.getStats("audio").then((stats) => this.subscriberAudioStats.innerText = stats);
        }, 1000);
    }
}

const page = new Page();
