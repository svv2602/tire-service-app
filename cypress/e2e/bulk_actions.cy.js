describe('Массовое удаление партнеров', () => {
  beforeEach(() => {
    cy.visit('/admin/partners');
  });

  it('Массовое удаление', () => {
    cy.get('input[type="checkbox"]').first().check();
    cy.get('input[type="checkbox"]').eq(1).check();
    cy.contains('Удалить выбранные').click();
    cy.contains('Партнеры успешно удалены');
  });
});
