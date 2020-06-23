package cn.edu.fudan.redcarpet.service;

public interface WXOpenService {
    String getAccessToken();

    String getOpenId(String code);

    byte[] getWXACode(String scene, String page);

}
