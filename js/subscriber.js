class Subscriber extends GoWebRTCClient {
    constructor() {
        super("subscriber")
        this.tcpDataChannel;
        this.messageReceiver;
        this.stats = {
            video: { prevTime: 0, prevBytes: 0 },
            audio: { prevTime: 0, prevBytes: 0 },
            data: { prevTime: 0, prevBytes: 0 }
        };
    }

    async subscribe(video, audio, data) {
        const promise = this.newPeerConnection();

        if (video) { this.pc.addTransceiver("video", { direction: "recvonly" }); }
        if (audio) { this.pc.addTransceiver("audio", { direction: "recvonly" }); }
        if (data) {
            this.newDatachannel("tcp", { id: 1, negotiated: true }).then((dc) => {
                this.tcpDataChannel = dc;
                this.tcpDataChannel.onmessage = (event) => { this.receiveMessage(event.data); }
            });
        }

        this.pc.ontrack = (event) => { this.stream = event.streams[0]; }
        this.pc.setLocalDescription(await this.pc.createOffer());
        return promise;
    }

    async watch(publisherID) {
        let gowebrtcResponse = await this.sendCommand({ command: "watch", data: { id: publisherID } });
        if (gowebrtcResponse.data.error) {
            throw gowebrtcResponse.data.error;
        }
    }

    async receiveMessage(message) {
        this.messageReceiver.value = message;
    }

    async getStats(kind) {
        const reports = await this.pc.getStats();

        for (const report of reports) {
            if (report[1].type === "inbound-rtp" && report[1].kind === kind) {
                const bitRate = Math.round((report[1].bytesReceived - this.stats[kind].prevBytes) * 8 / (report[1].timestamp - this.stats[kind].prevTime));
                this.stats[kind].prevTime = report[1].timestamp;
                this.stats[kind].prevBytes = report[1].bytesReceived;
                return `${bitRate} kbits/sec`;
            }
        }

        return "0 kbits/sec";
    }
}
