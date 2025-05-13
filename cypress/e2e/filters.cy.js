describe('Фильтры: сервисные точки и услуги', () => {
  beforeEach(() => {
    cy.visit('/admin/service-points');
  });

  it('Фильтрация по активности', () => {
    cy.get('select[name="status"]').select('Неактивные');
    cy.get('button').contains('Применить фильтр').click();
    cy.get('table').contains('Неактивный');
  });

  it('Фильтрация по городу', () => {
    cy.get('select[name="city"]').select('TestCity');
    cy.get('button').contains('Применить фильтр').click();
    cy.get('table').contains('TestCity');
  });
});
