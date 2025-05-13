describe('API Диагностика', () => {
  it('Проверка получения партнера по id', () => {
    cy.visit('/admin/test-api');
    cy.contains('Категория').parent().find('select').first().click();
    cy.contains('Партнеры').click();
    cy.contains('Эндпоинт').parent().find('select').first().click();
    cy.contains('GET /api/partners/{id}').click();
    cy.get('input').filter('[label="id"], [placeholder*="id"], [name*="id"]').first().clear().type('2');
    cy.contains('Выполнить').click();
    cy.contains('Результат запроса:');
    cy.contains('@tyreservice.ua');
  });

  it('Проверка ошибки при несуществующем id', () => {
    cy.visit('/admin/test-api');
    cy.contains('Категория').parent().find('select').first().click();
    cy.contains('Партнеры').click();
    cy.contains('Эндпоинт').parent().find('select').first().click();
    cy.contains('GET /api/partners/{id}').click();
    cy.get('input').filter('[label="id"], [placeholder*="id"], [name*="id"]').first().clear().type('99999');
    cy.contains('Выполнить').click();
    cy.contains('error').should('exist');
  });
});
