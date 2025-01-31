import { Socket, Server } from "socket.io";
import { SocketActions } from "./tsTypes/peerActions";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

type RTCSendOfferObj = {
  offer: RTCSessionDescriptionInit | undefined;
  from: string;
  to: string;
};

type RTCReceiveOfferObj = {
  from: string;
  offer: RTCSessionDescriptionInit | undefined;
};
type RTCReceiveAnswerObj = {
  from: string;
  answer: RTCSessionDescriptionInit | undefined;
};

type RTCSendAnswerObj = {
  answer: RTCSessionDescriptionInit | undefined;
  from: string;
  to: string;
};

type RTCConnectionEstablishedSend = {
  success: boolean;
  from: string;
  to: string;
};
type RTCConnectionEstablishedReceived = {
  success: boolean;
  from: string;
};

type RTCcloseConnectionObj = {
  from: string;
  to: string;
};

interface CustomJwtPayload extends JwtPayload {
  room: string; // Adjust the structure as per your actual JWT payload
}

class RTCSocket {
  constructor(socket: Socket, io: Server) {
    socket.on(SocketActions.sendOffer, async ({ offer, from, to }: RTCSendOfferObj) => {
      if (!process.env.LOCAL_SECREAT) throw new Error("NO LOCAL SECREAT");
      try {
        const data = jwt.verify(from, process.env.LOCAL_SECREAT) as CustomJwtPayload;
        console.log(data, SocketActions.receivedOffer, to);
        const user = data.room;
        const forward: RTCReceiveOfferObj = { from: user, offer };
        io.to(to).emit(SocketActions.receivedOffer, forward);
      } catch (err: any) {
        this.unAuthorized(socket, io, `${err.name}:${err.message}`);
      }
    });
    socket.on(SocketActions.sendAnswer, async ({ answer, from, to }: RTCSendAnswerObj) => {
      if (!process.env.LOCAL_SECREAT) throw new Error("NO LOCAL SECREAT");
      try {
        const data = jwt.verify(from, process.env.LOCAL_SECREAT) as CustomJwtPayload;
        const user = data.room;
        const forward: RTCReceiveAnswerObj = { from: user, answer };
        io.to(to).emit(SocketActions.receivedAnswer, forward);
      } catch (err: any) {
        this.unAuthorized(socket, io, `${err.name}:${err.message}`);
      }
    });
    socket.on(SocketActions.connectionEstablished, async ({ from, to, success }: RTCConnectionEstablishedSend) => {
      if (!process.env.LOCAL_SECREAT) throw new Error("NO LOCAL SECREAT");
      try {
        const data = jwt.verify(from, process.env.LOCAL_SECREAT) as CustomJwtPayload;
        const user = data.room;
        const forward: RTCConnectionEstablishedReceived = { from: user, success };
        io.to(to).emit(SocketActions.connectionEstablished, forward);
      } catch (err: any) {
        this.unAuthorized(socket, io, `${err.name}:${err.message}`);
      }
    });
    socket.on(SocketActions.closeConnection, async ({ from, to }: RTCcloseConnectionObj) => {
      if (!process.env.LOCAL_SECREAT) throw new Error("NO LOCAL SECREAT");
      try {
        const data = jwt.verify(from, process.env.LOCAL_SECREAT) as CustomJwtPayload;
        const user = data.room;
        const forward: { from: string } = { from: user };
        io.to(to).emit(SocketActions.closeConnection, forward);
      } catch (err: any) {
        this.unAuthorized(socket, io, `${err.name}:${err.message}`);
      }
    });
  }
  private unAuthorized(socket: Socket, io: Server, msg: string) {
    io.to(socket.id).emit(SocketActions.unAuthorized, { status: 401, msg });
  }
}
export default RTCSocket;
