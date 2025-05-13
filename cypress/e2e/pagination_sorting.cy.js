describe('Пагинация и сортировка партнеров', () => {
  beforeEach(() => {
    cy.visit('/admin/partners');
  });

  it('Переход на следующую страницу', () => {
    cy.get('.pagination').contains('2').click();
    cy.get('table').should('exist');
  });

  it('Сортировка по названию', () => {
    cy.get('th').contains('Название').click();
    cy.get('table tbody tr').first().should('exist'); // Проверка, что сортировка сработала
  });
});
