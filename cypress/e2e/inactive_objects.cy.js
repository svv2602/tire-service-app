describe('Работа с неактивными сервисными точками', () => {
  beforeEach(() => {
    cy.visit('/admin/service-points');
  });

  it('Показать неактивные точки', () => {
    cy.get('select[name="status"]').select('Неактивные');
    cy.get('button').contains('Применить фильтр').click();
    cy.get('table').contains('Неактивный');
  });

  it('Редактирование неактивной точки', () => {
    cy.get('select[name="status"]').select('Неактивные');
    cy.get('button').contains('Применить фильтр').click();
    cy.get('table').find('tr').first().find('button[title="Редактировать"]').click();
    cy.get('input[name="name"]').clear().type('Обновленная неактивная точка');
    cy.get('button[type="submit"]').click();
    cy.contains('Обновленная неактивная точка');
  });
});
