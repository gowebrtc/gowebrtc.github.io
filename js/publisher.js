class Publisher extends GoWebRTCClient {
    constructor() {
        super("publisher")
        this.stream;
        this.tcpDataChannel;
        this.stats = {
            video: { prevTime: 0, prevBytes: 0 },
            audio: { prevTime: 0, prevBytes: 0 },
            data: { prevTime: 0, prevBytes: 0 }
        };
    }

    async publish(video, audio, data) {
        const promise = this.newPeerConnection();

        if (video || audio) {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: video, audio: audio });
            if (video) this.pc.addTransceiver(this.stream.getVideoTracks()[0], { direction: "sendonly" });
            if (audio) this.pc.addTransceiver(this.stream.getAudioTracks()[0], { direction: "sendonly" });
        }

        if (data) {
            this.newDatachannel("tcp", { id: 1, negotiated: true }).then((dc) => { this.tcpDataChannel = dc });
        }

        this.pc.setLocalDescription(await this.pc.createOffer());
        return promise;
    }

    async sendMessage(message) {
        this.tcpDataChannel.send(message);
    }

    async getStats(kind) {
        const reports = await this.pc.getStats();

        for (const report of reports) {
            if (report[1].type === "outbound-rtp" && report[1].kind === kind) {
                const bitRate = Math.round((report[1].bytesSent - this.stats[kind].prevBytes) * 8 / (report[1].timestamp - this.stats[kind].prevTime));
                this.stats[kind].prevTime = report[1].timestamp;
                this.stats[kind].prevBytes = report[1].bytesSent;
                return `${bitRate} kbits/sec`;
            }
        }

        return "0 kbits/sec";
    }
}
