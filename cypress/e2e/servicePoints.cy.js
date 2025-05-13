describe('Сервисные точки: CRUD и фильтры', () => {
  beforeEach(() => {
    cy.visit('/admin/service-points');
  });

  it('Создание новой сервисной точки', () => {
    cy.contains('Добавить').click();
    cy.get('input').filter('[name*="name"], [placeholder*="назв"]').type('Тестовая точка');
    cy.get('input').filter('[name*="address"], [placeholder*="адрес"]').type('Тестовый адрес, 1');
    cy.get('input').filter('[name*="region"], [placeholder*="регион"]').type('TestRegion');
    cy.get('input').filter('[name*="city"], [placeholder*="город"]').type('TestCity');
    cy.get('input').filter('[name*="phone"], [placeholder*="тел"]').type('+380111111111');
    cy.get('button').contains('Создать').click();
    cy.contains('Тестовая точка');
  });

  it('Фильтрация по региону', () => {
    cy.get('select').filter('[name*="region"]').first().select('TestRegion');
    cy.get('button').contains('Применить').click();
    cy.get('table').contains('TestRegion');
  });

  it('Удаление сервисной точки', () => {
    cy.contains('Тестовая точка').parents('tr').find('button').contains('Удалить').click();
    cy.contains('Подтвердить').click();
    cy.contains('Тестовая точка').should('not.exist');
  });
});
