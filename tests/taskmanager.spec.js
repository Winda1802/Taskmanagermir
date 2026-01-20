// @ts-check
const { test, expect } = require('@playwright/test');

test.describe.serial('TaskForce App', () => {
  
  test.beforeEach(async ({ page, request }) => {
    // Reset de database voor elke test
    await request.post('/api/reset');
    await page.goto('/');
    // Wacht tot de pagina volledig geladen is en taken zichtbaar zijn
    await page.waitForSelector('.task-item', { timeout: 30000 });
  });

  test('should display the app title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('TaskForce');
  });

  test('should display 5 tasks in the list', async ({ page }) => {
    const tasks = page.locator('.task-item');
    await expect(tasks).toHaveCount(5);
  });

  
  test('should display correct initial statistics', async ({ page }) => {
    const totalTasks = page.locator('#totalTasks');
    const completedTasks = page.locator('#completedTasks');
    
    await expect(totalTasks).toHaveText('5');
    await expect(completedTasks).toHaveText('0');
  });

  test('should mark a task as completed when checkbox is clicked', async ({ page }) => {
    const firstCheckbox = page.locator('.task-checkbox').first();
    
    // Klik en wacht tot completed class verschijnt
    await firstCheckbox.click();
    await expect(page.locator('.task-item.completed')).toHaveCount(1, { timeout: 10000 });
  });

  test('should update completed count when task is checked', async ({ page }) => {
    const completedTasks = page.locator('#completedTasks');
    
    // Initially 0 completed
    await expect(completedTasks).toHaveText('0');
    
    // Check first task
    await page.locator('.task-checkbox').first().click();
    await expect(completedTasks).toHaveText('1', { timeout: 10000 });
    
    // Check second task
    await page.locator('.task-checkbox').nth(1).click();
    await expect(completedTasks).toHaveText('2', { timeout: 10000 });
  });

  test('should unmark a task when checkbox is unchecked', async ({ page }) => {
    const completedTasks = page.locator('#completedTasks');
    
    // Check the first task
    await page.locator('.task-checkbox').first().click();
    await expect(completedTasks).toHaveText('1', { timeout: 10000 });
    
    // Uncheck the task
    await page.locator('.task-checkbox').first().click();
    await expect(completedTasks).toHaveText('0', { timeout: 10000 });
  });

  test('should display all task labels correctly', async ({ page }) => {
    const taskLabels = [
      'Project documentatie schrijven',
      'Code review voor team uitvoeren',
      'Meeting met stakeholders voorbereiden',
      'Unit tests schrijven voor nieuwe features',
      'Deployment pipeline configureren'
    ];
    
    for (let i = 0; i < taskLabels.length; i++) {
      const label = page.locator('.task-label').nth(i);
      await expect(label).toHaveText(taskLabels[i]);
    }
  });

  test('should add a new task', async ({ page }) => {
    const newTaskInput = page.locator('#newTaskInput');
    const addTaskBtn = page.locator('.add-task-btn');
    
    await newTaskInput.fill('Nieuwe test taak');
    await addTaskBtn.click();
    
    // Wacht tot de nieuwe taak verschijnt
    await expect(page.locator('#totalTasks')).toHaveText('6', { timeout: 10000 });
    await expect(page.locator('.task-label').last()).toHaveText('Nieuwe test taak');
  });

  test('should delete a task', async ({ page }) => {
    // Hover over eerste taak om verwijderknop te tonen
    await page.locator('.task-item').first().hover();
    await page.locator('.delete-btn').first().click();
    
    // Wacht tot taak verwijderd is
    await expect(page.locator('.task-item')).toHaveCount(4, { timeout: 10000 });
  });

  test('should not add empty task', async ({ page }) => {
    const addTaskBtn = page.locator('.add-task-btn');
    const totalTasks = page.locator('#totalTasks');
    
    // Probeer lege taak toe te voegen
    await addTaskBtn.click();
    
    // Aantal taken moet gelijk blijven
    await expect(totalTasks).toHaveText('5');
  });

  test('should clear input after adding task', async ({ page }) => {
    const newTaskInput = page.locator('#newTaskInput');
    const addTaskBtn = page.locator('.add-task-btn');
    
    await newTaskInput.fill('Test taak');
    await addTaskBtn.click();
    
    // Wacht tot taak is toegevoegd
    await expect(page.locator('#totalTasks')).toHaveText('6', { timeout: 10000 });
    
    // Input moet leeg zijn
    await expect(newTaskInput).toHaveValue('');
  });

  test('should persist completed state after page reload', async ({ page }) => {
    // Vink eerste taak aan
    await page.locator('.task-checkbox').first().click();
    await expect(page.locator('#completedTasks')).toHaveText('1', { timeout: 10000 });
    
    // Herlaad pagina
    await page.reload();
    await page.waitForSelector('.task-item');
    
    // Status moet behouden blijven
    await expect(page.locator('#completedTasks')).toHaveText('1');
    await expect(page.locator('.task-item.completed')).toHaveCount(1);
  });

  test('should show delete button on hover', async ({ page }) => {
    const deleteBtn = page.locator('.delete-btn').first();
    const taskItem = page.locator('.task-item').first();
    
    // Hover over taak om verwijderknop zichtbaar te maken
    await taskItem.hover();
    
    // Wacht tot de transition klaar is en knop zichtbaar is
    await expect(deleteBtn).toBeVisible();
  });

  test('should update statistics after deleting completed task', async ({ page }) => {
    // Vink eerste taak aan
    await page.locator('.task-checkbox').first().click();
    await expect(page.locator('#completedTasks')).toHaveText('1', { timeout: 10000 });
    
    // Verwijder de afgevinkte taak
    await page.locator('.task-item').first().hover();
    await page.locator('.delete-btn').first().click();
    
    // Statistieken moeten correct zijn
    await expect(page.locator('#totalTasks')).toHaveText('4', { timeout: 10000 });
    await expect(page.locator('#completedTasks')).toHaveText('0');
  });

  test('should add task with Enter key', async ({ page }) => {
    const newTaskInput = page.locator('#newTaskInput');
    
    await newTaskInput.fill('Enter test taak');
    await newTaskInput.press('Enter');
    
    // Nieuwe taak moet toegevoegd zijn
    await expect(page.locator('#totalTasks')).toHaveText('6', { timeout: 10000 });
    await expect(page.locator('.task-label').last()).toHaveText('Enter test taak');
  });
});
