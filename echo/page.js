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
        this.publisherText = document.getElementById("publisherText");
        this.publisherText.addEventListener("keydown", (event) => { if (event.key === "Enter") this.sendMessage(); })

        this.subscriber = new Subscriber();
        this.subscriberVideo = document.getElementById("subscriberVideo");
        this.subscriberVideoCheckbox = document.getElementById("subscriberVideoCheckbox");
        this.subscriberAudioCheckbox = document.getElementById("subscriberAudioCheckbox");
        this.subscriberDataCheckbox = document.getElementById("subscriberDataCheckbox");
        this.subscriberVideoStats = document.getElementById("subscriberVideoStats");
        this.subscriberAudioStats = document.getElementById("subscriberAudioStats");
        this.subscriberDataStats = document.getElementById("subscriberDataStats");
        this.subscriberText = document.getElementById("subscriberText");

        this.startButton = document.getElementById("startButton");
        this.startButton.addEventListener("click", () => { this.start(); })
    }

    async start() {
        try {
            const publisherPromise = this.publisher.publish(this.publisherVideoCheckbox.checked, this.publisherAudioCheckbox.checked, this.publisherDataCheckbox.checked);
            const subscriberPromise = this.subscriber.subscribe(this.subscriberVideoCheckbox.checked, this.subscriberAudioCheckbox.checked, this.subscriberDataCheckbox.checked);
            await Promise.all([publisherPromise, subscriberPromise]);
            this.publisherID.value = this.publisher.id;
            this.subscriber.watch(this.publisher.id);
            this.publisherVideo.srcObject = this.publisher.stream;
            this.subscriberVideo.srcObject = this.subscriber.stream;
            if (this.publisherDataCheckbox.checked) this.publisherText.disabled = false;
            this.startButton.disabled = true;
            this.publisherVideoCheckbox.disabled = true;
            this.publisherAudioCheckbox.disabled = true;
            this.publisherDataCheckbox.disabled = true;
            this.subscriberVideoCheckbox.disabled = true;
            this.subscriberAudioCheckbox.disabled = true;
            this.subscriberDataCheckbox.disabled = true;
            this.subscriber.messageReceiver = this.subscriberText;
            this.showStats();
        } catch (error) {
            this.publisherID.placeholder = error;
        }
    }

    async sendMessage() {
        try {
            let message = this.publisherText.value;
            this.publisherText.value = "";
            this.publisher.sendMessage(message);
            this.publisherText.placeholder = "message sent";
        } catch (error) {
            this.publisherText.placeholder = error;
        }
    }

    async showStats() {
        setInterval(async () => {
            if (this.publisherVideoCheckbox.checked) this.publisher.getStats("video").then((stats) => this.publisherVideoStats.innerText = stats);
            if (this.publisherAudioCheckbox.checked) this.publisher.getStats("audio").then((stats) => this.publisherAudioStats.innerText = stats);
            if (this.subscriberVideoCheckbox.checked) this.subscriber.getStats("video").then((stats) => this.subscriberVideoStats.innerText = stats);
            if (this.subscriberAudioCheckbox.checked) this.subscriber.getStats("audio").then((stats) => this.subscriberAudioStats.innerText = stats);
        }, 1000);
    }
}

const page = new Page();
