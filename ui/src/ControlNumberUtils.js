export function expandControlNumberRanges(srcItems){
  const items = [];

  for (const item of srcItems) {
    const value = String(item.value);
    const matches = value.match(/^(\d+)-(\d+)$/);

    if (matches){
      const start = Number(matches[1]);
      const end = Number(matches[2]);

      for (let i = start; i <= end; i++) {
        const title = String(item.title).replace(/(\d+)to\d+$/, (a, b) => String(Number(b) + i - start));
        items.push({ value: i, title, text: item.text });
      }
      continue;
    }

    items.push({ value: item.value, title: item.title, text: item.text });
  }

  return items;
}

export function getControlNumbersDict(srcItems){
  const dict = {};

  for (const item of expandControlNumberRanges(srcItems)) {
    dict[item.value] = item;
  }

  return dict;
}
