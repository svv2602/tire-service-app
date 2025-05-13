describe('Услуги: просмотр и фильтрация', () => {
  beforeEach(() => {
    cy.visit('/admin/services');
  });

  it('Проверка наличия тестовых услуг', () => {
    cy.contains('Сезонная замена шин');
    cy.contains('Ремонт проколов');
    cy.contains('Балансировка колес');
    cy.contains('Шиномонтаж RunFlat');
    cy.contains('Хранение шин');
  });

  it('Фильтрация по названию услуги', () => {
    cy.get('input[placeholder="Поиск по названию"]')
      .type('Балансировка');
    cy.get('table').contains('Балансировка колес');
  });
});
