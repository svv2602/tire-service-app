describe('Валидация форм создания партнера', () => {
  beforeEach(() => {
    cy.visit('/admin/partners');
    cy.contains('Добавить партнера').click();
  });

  it('Проверка обязательности полей', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Поле обязательно').should('exist');
  });

  it('Проверка формата email', () => {
    cy.get('input[name="email"]').type('not-an-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Некорректный email').should('exist');
  });

  it('Проверка уникальности названия', () => {
    cy.get('input[name="company_name"]').type('ШинСервіс');
    cy.get('input[name="contact_person"]').type('Тест');
    cy.get('input[name="phone"]').type('+380501112233');
    cy.get('input[name="email"]').type('unique@tyreservice.ua');
    cy.get('button[type="submit"]').click();
    cy.contains('уже существует').should('exist');
  });
});
