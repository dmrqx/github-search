/* globals FormData */

const { resolve } = require('path')
const { JSDOM } = require('jsdom')

const { fireEvent, getRoles, screen, within } = require('@testing-library/dom')
require('@testing-library/jest-dom/extend-expect')

beforeEach(async () => {
  const dom = await JSDOM.fromFile(resolve(__dirname, 'index.html'), null)
  document.body.innerHTML = dom.window.document.body.innerHTML
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('GitHub User Search Form', () => {
  describe('Interface', () => {
    it('renders a heading that reads "GitHub Search"', () => {
      const pageHeading = screen.getByRole('heading')

      expect(pageHeading).toHaveTextContent('GitHub Search')
    })

    it('renders a form with a search input and a submit button', () => {
      const searchForm = screen.getByRole('form')

      expect(getRoles(searchForm)).toHaveProperty('searchbox')
      expect(getRoles(searchForm)).toHaveProperty('button')
    })
  })

  describe('Behavior', () => {
    const validGitHubHandles = ['JoviDeCroock', 'luong-komorebi', 'diego3g']
    const invalidGitHubHandles = [
      '-Jovi-DeCroock-',
      'luong--komorebi',
      'diego_%&3g'
    ]

    it('validates search input value against provided "pattern" attribute', () => {
      const searchForm = screen.getByRole('form')
      const searchInput = within(searchForm).getByLabelText(
        'Search a GitHub user by its handle'
      )

      validGitHubHandles.forEach(validHandle => {
        fireEvent.change(searchInput, { target: { value: validHandle } })
        expect(searchForm.checkValidity()).toBeTruthy()
      })

      invalidGitHubHandles.forEach(invalidHandle => {
        fireEvent.change(searchInput, { target: { value: invalidHandle } })
        expect(searchForm.checkValidity()).toBeFalsy()
      })
    })

    it('redirects the user to GitHub search results page with given form value on submit', () => {
      const searchForm = screen.getByRole('form')
      const searchInput = within(searchForm).getByLabelText(
        'Search a GitHub user by its handle'
      )

      const onSubmit = jest.fn(event => {
        event.preventDefault()

        const formValues = Object.fromEntries(new FormData(event.target))
        const searchParams = new URLSearchParams(formValues)

        return `${searchForm.getAttribute('action')}?${searchParams.toString()}`
      })

      searchForm.addEventListener('submit', onSubmit)

      fireEvent.change(searchInput, {
        target: { value: validGitHubHandles[0] }
      })
      fireEvent.submit(searchForm)

      expect(onSubmit).toHaveReturnedWith(
        `https://github.com/search?q=${validGitHubHandles[0]}&type=Users`
      )
    })
  })
})
