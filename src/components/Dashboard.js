import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const teamData = [
  {
    name: '양정화',
    preScore: 34,
    postScore: 35,
    growth: 9,
    support: 9,
    totalScore: 95,
    rank: 1,
    evaluation: '성숙한 전문가 단계로 성장, 리더십 개발과 승진 준비로 발전한 성공적 사례'
  },
  {
    name: '권예지',
    preScore: 31,
    postScore: 32,
    growth: 9,
    support: 8,
    totalScore: 85,
    rank: 2,
    evaluation: '신입 대리로서의 빠른 성장과 실무 역량 향상, 높은 잠재력'
  },
  {
    name: '김진화',
    preScore: 27,
    postScore: 28,
    growth: 8,
    support: 8,
    totalScore: 80,
    rank: 3,
    evaluation: '성과 회복과 신뢰 재구축, 구체적인 전략 수립 능력'
  },
  {
    name: '김무성',
    preScore: 26,
    postScore: 31,
    growth: 8,
    support: 8,
    totalScore: 75,
    rank: 4,
    evaluation: '지속적인 성장세, 업무 안정성'
  }
];

function Dashboard() {
  return (
    <Grid container spacing={3}>
      {/* 점수 차트 */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
          <Typography variant="h6" gutterBottom>
            팀원별 평가 점수
          </Typography>
          <ResponsiveContainer>
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="preScore" name="사전 평가" fill="#8884d8" />
              <Bar dataKey="postScore" name="사후 평가" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* 순위 테이블 */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
          <Typography variant="h6" gutterBottom>
            종합 순위
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>순위</TableCell>
                  <TableCell>이름</TableCell>
                  <TableCell>종합점수</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.rank}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.totalScore}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* 상세 평가 테이블 */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            상세 평가
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>성장성</TableCell>
                  <TableCell>팀장 지원</TableCell>
                  <TableCell>평가 내용</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.growth}</TableCell>
                    <TableCell>{row.support}</TableCell>
                    <TableCell>{row.evaluation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard; 