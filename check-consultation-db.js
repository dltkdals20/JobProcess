const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: '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',
});

const DATABASE_ID = '20f42078-beef-81fd-9a46-f1f9747a9268';

async function getConsultationDatabase() {
  try {
    // 데이터베이스 정보 가져오기
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID
    });
    
    console.log('\n=== 데이터베이스 정보 ===');
    console.log('제목:', database.title[0]?.plain_text || '제목 없음');
    console.log('속성:', Object.keys(database.properties).join(', '));
    
    // 데이터베이스 내용 가져오기
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending'
        }
      ]
    });
    
    console.log('\n=== 상담 기록 ===');
    response.results.forEach(page => {
      const properties = page.properties;
      console.log('\n---');
      Object.entries(properties).forEach(([key, value]) => {
        let content = '';
        switch (value.type) {
          case 'title':
            content = value.title[0]?.plain_text || '';
            break;
          case 'rich_text':
            content = value.rich_text[0]?.plain_text || '';
            break;
          case 'date':
            content = value.date?.start || '';
            break;
          case 'select':
            content = value.select?.name || '';
            break;
          default:
            content = JSON.stringify(value);
        }
        console.log(`${key}: ${content}`);
      });
    });
    
  } catch (error) {
    console.error('에러 발생:', error.message);
  }
}

getConsultationDatabase(); 