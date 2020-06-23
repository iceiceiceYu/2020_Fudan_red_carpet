package cn.edu.fudan.redcarpet.util;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.net.UnknownHostException;

public class IpUtils {
    public static String getIpAddr(HttpServletRequest request) {
        String ipAddress;
        try {
            ipAddress = request.getHeader("x-forwarded-for");
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
                if (ipAddress.equals("127.0.0.1")) {
                    // 根据网卡取本机配置的IP
                    InetAddress inet;
                    try {
                        inet = InetAddress.getLocalHost();
                        ipAddress = inet.getHostAddress();
                    } catch (UnknownHostException e) {
                        e.printStackTrace();
                    }
                }
            }
            // 对于通过多个代理的情况，第一个IP为客户端真实IP,多个IP按照','分割
            if (ipAddress != null && ipAddress.length() > 15) { // "***.***.***.***".length()
                // = 15
                if (ipAddress.indexOf(",") > 0) {
                    ipAddress = ipAddress.substring(0, ipAddress.indexOf(","));
                }
            }
        } catch (Exception e) {
            ipAddress = "";
        }
        // ipAddress = this.getRequest().getRemoteAddr();

        return ipAddress;
    }

    public static boolean internalIp(String ipAddress) {
        String[] addr = ipAddress.split("\\.");
        try {
            final byte b0 = (byte) Integer.parseInt(addr[0]);
            final byte b1 = (byte) Integer.parseInt(addr[1]);
            final byte b2 = (byte) Integer.parseInt(addr[2]);
            //10.x.x.x/8
            final byte SECTION_1 = 0x0A;
            //172.16.x.x/12
            final byte SECTION_2 = (byte) 0xAC;
            final byte SECTION_3 = (byte) 0x10;
            final byte SECTION_4 = (byte) 0x1F;
            //192.168.x.x/16
            final byte SECTION_5 = (byte) 0xC0;
            final byte SECTION_6 = (byte) 0xA8;
            //202.120.224.x
            final byte SECTION_YU1 = (byte) 0xCA;
            final byte SECTION_YU2 = (byte) 0x78;
            final byte SECTION_YU3 = (byte) 0xE0;
            switch (b0) {
                case SECTION_1:
                    return true;
                case SECTION_2:
                    return b1 >= SECTION_3 && b1 <= SECTION_4;
                case SECTION_5:
                    return b1 == SECTION_6;
                case SECTION_YU1:
                    return b1 == SECTION_YU2 && b2 == SECTION_YU3;
                default:
                    return false;
            }
        } catch (Exception ignore) {
        }
        return false;
    }
}
