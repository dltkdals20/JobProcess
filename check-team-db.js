const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: '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',
});

const TEAM_DB_ID = '20c42078-beef-80ee-859e-d189e4c55ea8'; // 데이터베이스 목록에서 확인한 팀원 데이터베이스 ID

async function getTeamMembers() {
  try {
    const response = await notion.databases.query({
      database_id: TEAM_DB_ID
    });
    console.log('\n=== 팀원 명단 ===');
    response.results.forEach(page => {
      const nameProp = page.properties['이름'];
      let name = '';
      if (nameProp) {
        if (nameProp.type === 'title') {
          name = nameProp.title[0]?.plain_text || '';
        } else {
          name = JSON.stringify(nameProp);
        }
      }
      console.log(`- ${name}`);
    });
  } catch (error) {
    console.error('에러 발생:', error.message);
  }
}

getTeamMembers(); 