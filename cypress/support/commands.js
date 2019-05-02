// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/**
 * Handles all file uploads
 */
// Cypress.Commands.add(
//   'upload_file',
//   { prevSubject: 'element' },
//   (subject, fileName) => {
//     return cy
//       .fixture(fileName, 'base64')
//       .then(Cypress.Blob.base64StringToBlob)
//       .then(blob => {
//         // instantiate File from `application` window, not cypress window
//         return cy.window().then(win => {
//           const file = new win.File([blob], fileName)
//           const dataTransfer = new win.DataTransfer()
//           dataTransfer.items.add(file)

//           return cy.wrap(subject).trigger('drop', {
//             dataTransfer,
//           })
//         })
//       })
//   }
// )
Cypress.Commands.add('upload_file', (fileName, selector, type = 'image/png') => {
    return cy.get(selector)
        .then(subject => {
            return cy.fixture(fileName, 'base64')
                .then(Cypress.Blob.base64StringToBlob)
                .then(blob => {
                    const el = subject[0]
                    const testFile = new File([blob], fileName, { type })
                    const dataTransfer = new DataTransfer()
                    dataTransfer.items.add(testFile)
                    el.files = dataTransfer.files
                    return subject;
                })
        })
        .trigger('change')
})

Cypress.Commands.add('add_ingredient', (index, ingredient) => {
    cy
        .get(`[data-test="cooking update ingredient-${index} name"]`)
        .select(ingredient.name)
        .should('have.value', ingredient.name)
    cy
        .get(`[data-test="cooking update ingredient-${index} quantity"]`)
        .type(ingredient.quantity)
        .should('have.value', ingredient.quantity)
    return cy
        .get(`[data-test="cooking update ingredient-${index} description"]`)
        .type(ingredient.description)
        .should('have.value', ingredient.description)
})

Cypress.Commands.add('add_procedure', (index, procedure) => {
    return cy
        .get(`[data-test="cooking update procedure-${index} name"]`)
        .type(procedure)
        .should('have.value', procedure)
})