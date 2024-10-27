import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io";
import { IState } from "./types";

export const setupSocket = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  const state: IState = {
    board_content: "",
    locked_by_user_id: "",
  };

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    console.log("Emitting state - ", JSON.stringify(state));
    io.emit("state", state);

    socket.on("request-access", (user_id) => {
      if (
        !Array.from(io.sockets.sockets.keys()).includes(state.locked_by_user_id)
      ) {
        state.locked_by_user_id = user_id;
        io.emit("state", state);
      }
      if (user_id && !state.locked_by_user_id.length) {
        state.locked_by_user_id = user_id;
        io.emit("state", state);
      }
    });

    socket.on("remove-access", (user_id) => {
      if (user_id && state.locked_by_user_id === user_id) {
        state.locked_by_user_id = "";
        io.emit("state", state);
      }
    });

    socket.on("board-content", (board_content) => {
      state.board_content = board_content;
      io.emit("state", state);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
