import { Server, Socket } from "socket.io";
import { IState } from "./types";

const state: IState = {
  board_content: "",
  locked_by_user_id: "",
};

// Helper functions for handling state
const lockAccess = (user_id: string) => {
  if (!state.locked_by_user_id) {
    state.locked_by_user_id = user_id;
    return true;
  }
  return false;
};

const releaseAccess = (user_id: string) => {
  if (state.locked_by_user_id === user_id) {
    state.locked_by_user_id = "";
    return true;
  }
  return false;
};

const updateBoardContent = (board_content: string) => {
  state.board_content = board_content;
};

// Main function to set up socket
export const setupSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("A user connected:", socket.id);
    io.emit("state", state);

    socket.on("request-access", (user_id: string) =>
      handleRequestAccess(io, user_id)
    );
    socket.on("remove-access", (user_id: string) =>
      handleRemoveAccess(io, user_id)
    );
    socket.on("board-content", (board_content: string) =>
      handleBoardContent(io, board_content)
    );
    socket.on("disconnect", () => handleDisconnect(socket));
  });
};

// Event handlers
const handleRequestAccess = (io: Server, user_id: string) => {
  if (lockAccess(user_id)) {
    io.emit("state", state);
  }
};

const handleRemoveAccess = (io: Server, user_id: string) => {
  if (releaseAccess(user_id)) {
    io.emit("state", state);
  }
};

const handleBoardContent = (io: Server, board_content: string) => {
  updateBoardContent(board_content);
  io.emit("state", state);
};

const handleDisconnect = (socket: Socket) => {
  console.log("User disconnected:", socket.id);
};
