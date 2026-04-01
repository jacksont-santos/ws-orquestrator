"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessage = void 0;
var MessageType_1 = require("./MessageType");
var MessageAction = __importStar(require("./index"));
var onMessage = function (ws, message) { return __awaiter(void 0, void 0, void 0, function () {
    var raw, type, authToken, data, _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 19, , 20]);
                raw = JSON.parse(message);
                type = raw.type, authToken = raw.authToken, data = raw.data;
                if (type != MessageType_1.MessageType.CONNECTION && !ws.userId && !raw.notification) {
                    MessageAction.unauthorizedError(ws);
                    return [2 /*return*/];
                }
                ;
                _a = type;
                switch (_a) {
                    case MessageType_1.MessageType.CONNECTION: return [3 /*break*/, 1];
                    case MessageType_1.MessageType.ROOMS_STATE: return [3 /*break*/, 3];
                    case MessageType_1.MessageType.ROOM_STATE: return [3 /*break*/, 5];
                    case MessageType_1.MessageType.FIRST_SIGNIN_ROOM: return [3 /*break*/, 7];
                    case MessageType_1.MessageType.SIGNIN_ROOM: return [3 /*break*/, 9];
                    case MessageType_1.MessageType.SIGNOUT_ROOM: return [3 /*break*/, 11];
                    case MessageType_1.MessageType.ADD_ROOM: return [3 /*break*/, 13];
                    case MessageType_1.MessageType.UPDATE_ROOM: return [3 /*break*/, 13];
                    case MessageType_1.MessageType.REMOVE_ROOM: return [3 /*break*/, 13];
                    case MessageType_1.MessageType.CHAT: return [3 /*break*/, 15];
                }
                return [3 /*break*/, 17];
            case 1: return [4 /*yield*/, MessageAction.connect(ws, authToken)];
            case 2:
                _b.sent();
                return [3 /*break*/, 18];
            case 3: return [4 /*yield*/, MessageAction.getRoomsState(ws)];
            case 4:
                _b.sent();
                return [3 /*break*/, 18];
            case 5: return [4 /*yield*/, MessageAction.getRoomState(ws, data)];
            case 6:
                _b.sent();
                return [3 /*break*/, 18];
            case 7: return [4 /*yield*/, MessageAction.firstSignIn(data, ws)];
            case 8:
                _b.sent();
                return [3 /*break*/, 18];
            case 9: return [4 /*yield*/, MessageAction.signin(data, ws)];
            case 10:
                _b.sent();
                return [3 /*break*/, 18];
            case 11: return [4 /*yield*/, MessageAction.signOut(data, ws)];
            case 12:
                _b.sent();
                return [3 /*break*/, 18];
            case 13: return [4 /*yield*/, MessageAction.notifierChanges(raw)];
            case 14:
                _b.sent();
                return [3 /*break*/, 18];
            case 15: return [4 /*yield*/, MessageAction.onChatMessage(ws, raw)];
            case 16:
                _b.sent();
                return [3 /*break*/, 18];
            case 17:
                MessageAction.messageTypeError(ws);
                _b.label = 18;
            case 18: return [3 /*break*/, 20];
            case 19:
                error_1 = _b.sent();
                MessageAction.messageError(ws, error_1);
                return [3 /*break*/, 20];
            case 20: return [2 /*return*/];
        }
    });
}); };
exports.onMessage = onMessage;
//# sourceMappingURL=OnMessage.js.map