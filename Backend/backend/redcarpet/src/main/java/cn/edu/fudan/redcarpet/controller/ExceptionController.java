package cn.edu.fudan.redcarpet.controller;

import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.serviceImpl.WXOpenFailException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;

@ControllerAdvice
@Slf4j
public class ExceptionController {

    @ExceptionHandler(WXOpenFailException.class)
    public @ResponseBody
    MyResponse wxOpenFailHandler(WXOpenFailException e) {
        return MyResponse.fail(e.getMessage());
    }

    // file size too big
    @ExceptionHandler({MaxUploadSizeExceededException.class})
    public void handleSizeExceededException(final MultipartException ex) {
        log.warn("图片不符规定");
        log.warn(ex.getMessage());
    }
}
