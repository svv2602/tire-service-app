describe('Партнеры: CRUD', () => {
  beforeEach(() => {
    cy.visit('/admin/partners');
  });

  it('Создание нового партнера', () => {
    cy.contains('Добавить').click();
    cy.get('input').filter('[name*="company"], [placeholder*="комп"]').type('Тестовый партнер');
    cy.get('input').filter('[name*="contact"], [placeholder*="контакт"]').type('Тест Тестович');
    cy.get('input').filter('[name*="phone"], [placeholder*="тел"]').type('+380999999999');
    cy.get('input').filter('[name*="email"], [placeholder*="mail"]').type('testpartner@tyreservice.ua');
    cy.get('button').contains('Создать').click();
    cy.contains('Партнер успешно создан');
    cy.contains('Тестовый партнер');
  });

  it('Обновление партнера', () => {
    cy.contains('Тестовый партнер').parents('tr').find('button').contains('Редактировать').click();
    cy.get('input').filter('[name*="contact"], [placeholder*="контакт"]').clear().type('Измененный Контакт');
    cy.get('button').contains('Сохранить').click();
    cy.contains('Данные партнера обновлены');
    cy.contains('Измененный Контакт');
  });

  it('Удаление партнера', () => {
    cy.contains('Тестовый партнер').parents('tr').find('button').contains('Удалить').click();
    cy.contains('Подтвердить').click();
    cy.contains('Партнер успешно удален');
    cy.contains('Тестовый партнер').should('not.exist');
  });
});
