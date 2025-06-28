// Script to inspect Smart Product Filter structure
const container = document.querySelector('#gf-tree');
if (container) {
  console.log('=== SMART PRODUCT FILTER ANALYSIS ===');
  
  // Container info
  console.log('Container ID:', container.id);
  console.log('Container Classes:', container.className);
  
  // Find all checkboxes and their labels
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  console.log('\\nFound', checkboxes.length, 'filter checkboxes');
  
  checkboxes.forEach((checkbox, i) => {
    if (i < 10) { // Limit output
      const label = checkbox.closest('label') || checkbox.nextElementSibling;
      console.log(`\\nCheckbox ${i + 1}:`);
      console.log('  Value:', checkbox.value);
      console.log('  Checked:', checkbox.checked);
      console.log('  Checkbox classes:', checkbox.className);
      console.log('  Parent classes:', checkbox.parentElement?.className || 'none');
      if (label) {
        console.log('  Label text:', label.textContent.trim());
        console.log('  Label classes:', label.className);
      }
    }
  });
  
  // Find elements with count patterns like (317), (76)
  const countElements = [];
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (text.match(/^\\(\\d+\\)$/)) {
      countElements.push({
        text: text,
        parentElement: node.parentElement,
        parentClasses: node.parentElement.className
      });
    }
  });
  
  console.log('\\n=== COUNT ELEMENTS ===');
  countElements.slice(0, 8).forEach((item, i) => {
    console.log(`Count ${i + 1}: "${item.text}" - Parent classes: "${item.parentClasses}"`);
  });
  
  // Find filter option text elements
  const filterTexts = container.querySelectorAll('*');
  const textElements = [];
  
  filterTexts.forEach(el => {
    const text = el.textContent?.trim();
    if (text && (text === 'ASOS' || text === 'Mango' || text === 'modest' || text === 'moderately modest')) {
      textElements.push({
        text: text,
        tagName: el.tagName,
        classes: el.className,
        innerHTML: el.innerHTML
      });
    }
  });
  
  console.log('\\n=== FILTER TEXT ELEMENTS ===');
  textElements.slice(0, 10).forEach((item, i) => {
    console.log(`Text ${i + 1}: "${item.text}" - Tag: ${item.tagName} - Classes: "${item.classes}"`);
  });
  
} else {
  console.log('Smart Product Filter container (#gf-tree) not found!');
}
