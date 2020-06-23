package cn.edu.fudan.redcarpet.serviceImpl;

public class WXOpenFailException extends RuntimeException {

    WXOpenFailException(String message) {
        super(message);
    }

    WXOpenFailException(String message, Throwable cause) {
        super(message, cause);
    }
}
