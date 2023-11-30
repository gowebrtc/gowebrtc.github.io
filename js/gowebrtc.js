const GOWEBRTC_ENDPOINT = "https://api.gowebrtc.com";
// const GOWEBRTC_ENDPOINT = "http://localhost";

class GoWebRTCClient {
    constructor(kind) {
        this.kind = kind;
        this.id;
        this.pc;
        this.dc;
        this.dcResolve = {};
    }

    async newPeerConnection() {
        return new Promise((resolve, reject) => {
            this.pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            this.pc.onnegotiationneeded = (event) => { console.log(`${this.kind} peerconnection onnegotiationneeded`); }
            this.pc.onsignalingstatechange = (event) => { console.log(`${this.kind} peerconnection onsignalingstatechange:`, this.pc.signalingState); }
            this.pc.onicegatheringstatechange = (event) => { console.log(`${this.kind} peerconnection onicegatheringstatechange:`, this.pc.iceGatheringState); }
            this.pc.oniceconnectionstatechange = (event) => { console.log(`${this.kind} peerconnection oniceconnectionstatechange:`, this.pc.iceConnectionState); }
            this.pc.onicecandidate = (ice) => { if (ice.candidate === null) this.sendOffer().catch((error) => { reject(error) }) };

            this.newDatachannel("main", { id: 0, negotiated: true })
                .then((dc) => {
                    this.dc = dc;
                    this.dc.onmessage = (event) => { this.receiveCommand(event.data); }
                    resolve();
                })
                .catch((error) => { reject(error) });
        })
    }

    async newDatachannel(label, config) {
        return new Promise((resolve, reject) => {
            const dc = this.pc.createDataChannel(label, config);
            dc.onopen = (event) => { console.log(`${this.kind} ${label} datachannel open`); resolve(dc); }
            dc.onerror = (event) => { console.log(`${this.kind} ${label} datachannel error`); reject(event); }
            dc.onclose = (event) => { console.log(`${this.kind} ${label} datachannel closed`); }
        })
    }

    async sendOffer() {
        const body = JSON.stringify({ offer: this.pc.localDescription });
        console.log(`${this.kind} sending offer:`, body);
        const response = await fetch(`${GOWEBRTC_ENDPOINT}/${this.kind}`, { method: "POST", body: body });
        const jsonData = await response.text();
        console.log(`${this.kind} got answer:`, jsonData);
        const data = JSON.parse(jsonData);
        if (data.error) throw data.error;
        this.id = data.id;
        this.pc.setRemoteDescription(data.answer);
    }

    async sendCommand(command) {
        command.id = Date.now().toString();
        return new Promise((resolve, reject) => {
            this.dcResolve[command.id] = resolve;
            this.dc.send(JSON.stringify(command));
            setTimeout(reject, 5000);
        })
    }

    async receiveCommand(command) {
        command = JSON.parse(command);
        if (command.id) this.dcResolve[command.id](command);
    }
}
