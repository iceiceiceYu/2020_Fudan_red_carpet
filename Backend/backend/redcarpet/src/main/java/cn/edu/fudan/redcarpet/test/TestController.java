package cn.edu.fudan.redcarpet.test;

import cn.edu.fudan.redcarpet.domain.Nominee;
import cn.edu.fudan.redcarpet.domain.Vote;
import cn.edu.fudan.redcarpet.dto.MyResponse;
import cn.edu.fudan.redcarpet.repository.NomineeRepository;
import cn.edu.fudan.redcarpet.repository.UserRepository;
import cn.edu.fudan.redcarpet.repository.VoteRepository;
import cn.edu.fudan.redcarpet.service.WXOpenService;
import cn.edu.fudan.redcarpet.util.IpUtils;
import cn.edu.fudan.redcarpet.util.TimeUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequestMapping(path = "/test")
public class TestController {

    public TestController(WXOpenService wxOpenService) {
        this.wxOpenService = wxOpenService;
    }

    @GetMapping
    public String test(HttpServletRequest request) {
        String ipAddress = IpUtils.getIpAddr(request);
        return "hello world \n"
                + ipAddress + "\n";
    }


    @GetMapping(path = "/ip")
    public String test2(HttpServletRequest request) {
        String ipAddress = IpUtils.getIpAddr(request);
        return "hello world \n"
                + ipAddress + "\n";
    }


    private final WXOpenService wxOpenService;

    @GetMapping(path = "/access_token")
    public String accessToken() {
        return wxOpenService.getAccessToken();
    }

    @Autowired
    private VoteRepository voteRepository;
    @Autowired
    private NomineeRepository nomineeRepository;
    @Autowired
    private UserRepository userRepository;


    @GetMapping(path = "/vote/excel")
    public void excel(@RequestParam int nomineeId, HttpServletResponse response) throws Exception {
        response.setHeader("Content-Disposition", "attachment; filename=\"my-xls-file.xls\"");

        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("候选人" + nomineeId);
        Sheet abSheet = workbook.createSheet("异常时间段");

        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row abHeader = abSheet.createRow(0);
        Row header = sheet.createRow(0);

        XSSFFont font = workbook.createFont();
        font.setFontName("Arial");
        font.setFontHeightInPoints((short) 16);
        font.setBold(true);
        headerStyle.setFont(font);

        Cell headerCell = header.createCell(0);
        headerCell.setCellValue("id");
        headerCell.setCellStyle(headerStyle);

        headerCell = header.createCell(1);
        headerCell.setCellValue("ip");
        headerCell.setCellStyle(headerStyle);

        headerCell = header.createCell(2);
        headerCell.setCellValue("timestamp");
        headerCell.setCellStyle(headerStyle);

        headerCell = header.createCell(3);
        headerCell.setCellValue("weight");
        headerCell.setCellStyle(headerStyle);

        headerCell = header.createCell(4);
        headerCell.setCellValue("user_id");
        headerCell.setCellStyle(headerStyle);

        headerCell = abHeader.createCell(0);
        headerCell.setCellValue("start timestamp");
        headerCell.setCellStyle(headerStyle);

        headerCell = abHeader.createCell(1);
        headerCell.setCellValue("end timestamp");
        headerCell.setCellStyle(headerStyle);

        headerCell = abHeader.createCell(2);
        headerCell.setCellValue("投票次数");
        headerCell.setCellStyle(headerStyle);

        headerCell = abHeader.createCell(3);
        headerCell.setCellValue("权重和");
        headerCell.setCellStyle(headerStyle);

        List<Vote> votes = voteRepository.findAllByNomineeIdOrderByTimestampAsc(nomineeId);

        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        CellStyle warnStyle = workbook.createCellStyle();
        warnStyle.setWrapText(true);
        warnStyle.setFillForegroundColor(IndexedColors.RED.getIndex());
        warnStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Timestamp abStartTs = null;
        Timestamp abEndTs = null;
        int state = 0; // 0: normal; 1: abnormal
        int abVoteWeightSum = 0;
        int abVoteTimesSum = 0;

        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        int len = votes.size();
        int abRowIndex = 1;
        for (int i = 0; i < len; i++) {
            Vote vote = votes.get(i);
            Row row = sheet.createRow(i + 1);
            Cell cell = row.createCell(0);
            cell.setCellValue(vote.getId());
            cell.setCellStyle(style);

            cell = row.createCell(1);
            cell.setCellValue(vote.getIp());
            cell.setCellStyle(style);

            cell = row.createCell(2);
            cell.setCellValue(format.format(new Date(vote.getTimestamp().getTime())));

            // judge near
            if ((i >= 3 && vote.getTimestamp().getTime() - votes.get(i - 3).getTimestamp().getTime() <= 10000)
                    || (i < len - 3 && votes.get(i + 3).getTimestamp().getTime() - vote.getTimestamp().getTime() <= 10000)) {
                if (state == 0) {
                    abVoteWeightSum = 0;
                    abVoteTimesSum = 0;
                    abStartTs = votes.get(i - 3).getTimestamp();
                }
                abEndTs = vote.getTimestamp();
                abVoteWeightSum += vote.getWeight();
                abVoteTimesSum++;
                state = 1;
                cell.setCellStyle(warnStyle);
            } else {
                if (state == 1 && abVoteTimesSum > 200) { // 1min
                    Row abRow = abSheet.createRow(abRowIndex);

                    Cell abCell = abRow.createCell(0);
                    abCell.setCellValue(format.format(new Date(abStartTs.getTime())));
                    abCell.setCellStyle(style);

                    abCell = abRow.createCell(1);
                    abCell.setCellValue(format.format(new Date(abEndTs.getTime())));
                    abCell.setCellStyle(style);

                    abCell = abRow.createCell(2);
                    abCell.setCellValue(abVoteTimesSum);
                    abCell.setCellStyle(style);

                    abCell = abRow.createCell(3);
                    abCell.setCellValue(abVoteWeightSum);
                    abCell.setCellStyle(style);

                    abRowIndex++;
                    abVoteWeightSum = 0;
                }
                state = 0;
                cell.setCellStyle(style);
            }

            cell = row.createCell(3);
            cell.setCellValue(vote.getWeight());
            cell.setCellStyle(style);

            cell = row.createCell(4);
            cell.setCellValue(vote.getUser().getId());
            cell.setCellStyle(style);

        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }


//    @GetMapping(path = "/vote/delete")
    public synchronized MyResponse deleteVote(@RequestParam int nomineeId, @RequestParam String start, @RequestParam String end) throws Exception {
        Nominee nominee = nomineeRepository.findTopById(nomineeId);
        if (nominee == null) return MyResponse.fail("no nominee");

        Timestamp startTs = Timestamp.valueOf(start);
        Timestamp endTs = Timestamp.valueOf(end);


        List<Vote> votes = voteRepository.findAllByNomineeAndTimestampBetween(nominee, startTs, endTs);

        int voteNumber = nominee.getVotes();
        for (Vote v : votes)
            voteNumber -= v.getWeight();

        nominee.setVotes(voteNumber);

        nomineeRepository.save(nominee);
        voteRepository.deleteAll(votes);

        log.info("start:{}; end:{}; votes:{}", startTs, endTs, votes.size());

        return MyResponse.success("under developing");
    }

//    @GetMapping(path = "/vote/delete2")
    public synchronized MyResponse deleteVote(@RequestParam int nomineeId, @RequestParam String ip) throws Exception {
        Nominee nominee = nomineeRepository.findTopById(nomineeId);
        if (nominee == null) return MyResponse.fail("no nominee");

        List<Vote> votes = voteRepository.findAllByNomineeAndIp(nominee, ip);

        int voteWeightSum = 0;
        for (Vote v : votes)
            voteWeightSum += v.getWeight();

        nominee.setVotes(nominee.getVotes() - voteWeightSum);
        nomineeRepository.save(nominee);
        voteRepository.deleteAll(votes);

        log.info("ip:{}; votes:{}", ip, votes.size());

        return MyResponse.success("ok", votes.size());
    }

    @GetMapping(path = "/users")
    public MyResponse countUsers() {
        return MyResponse.success("", userRepository.count());
    }

    @GetMapping(path = "/votes")
    public MyResponse countVotes() {
        return MyResponse.success("", voteRepository.count());
    }

}
