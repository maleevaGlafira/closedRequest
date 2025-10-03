const fs = require('fs');

const inputFile = '../main-2025-5-28.log';
const outputFile = 'output/id_1562_output_5_28.txt';
const id1562Values = new Set(); // Множество для исключения дубликатов

// Чтение файла логов
const data = fs.readFileSync(inputFile, 'utf8').split('\n');

data.forEach(line => {
  try {
    const logEntry = JSON.parse(line.trim());
    if (logEntry.message.includes('FireBird Receive')) {
      // Извлечение JSON-объекта из сообщения
      const fbData = JSON.parse(logEntry.message.replace('FireBird Receive - ', ''));
      if (fbData.ID_1562) {
        id1562Values.add(fbData.ID_1562.toString());
      }
    }
  } catch (error) {
    // Пропускаем строки с некорректным JSON
  }
});

// Сортировка значений
const sortedValues = Array.from(id1562Values).sort((a, b) => a - b);

// Запись значений в файл через запятую и перенос строки
fs.writeFileSync(outputFile, sortedValues.join(',\n'), 'utf8');

console.log('Уникальные значения ID_1562 успешно записаны в', outputFile);