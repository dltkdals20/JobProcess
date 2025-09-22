const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: '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',
});

async function listDatabases() {
  try {
    const response = await notion.search({
      filter: {
        property: 'object',
        value: 'database'
      }
    });
    
    console.log('데이터베이스 목록:');
    response.results.forEach(db => {
      console.log(`- ${db.title[0]?.plain_text || '제목 없음'} (ID: ${db.id})`);
    });
  } catch (error) {
    console.error('에러 발생:', error.message);
  }
}

listDatabases(); 