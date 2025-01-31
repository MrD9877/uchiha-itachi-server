export enum SocketActions {
  requestConnection = "RTCPeerConnectionRequest",
  sendOffer = "offer Send from to a party",
  receivedOffer = "offer recived from a party",
  sendAnswer = "answer to offer send",
  receivedAnswer = "received answer to offer",
  connectionEstablished = "RTCPeerConnnectionEstablished",
  unAuthorized = "RTCPeerunAuthorized",
  closeConnection = "CloseRTCPeerConnection",
}
