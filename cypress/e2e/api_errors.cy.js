describe('Обработка ошибок API', () => {
  it('Показ ошибки 404 при несуществующем партнере', () => {
    cy.visit('/admin/test-api');
    cy.get('#category-select').click();
    cy.contains('Партнеры').click();
    cy.get('#endpoint-select').click();
    cy.contains('GET /api/partners/{id}').click();
    cy.get('input[label="id"]').clear().type('999999');
    cy.contains('Выполнить запрос').click();
    cy.contains('error').should('exist');
  });
});
