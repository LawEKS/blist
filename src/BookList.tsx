import React, { useState, useEffect } from "react"
import Container from "react-bootstrap/Container"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import Button from "react-bootstrap/Button"
import Spinner from "react-bootstrap/Spinner"
import { useLocation } from "react-router-dom"
import { postBooks, Book } from "./api"

function Header() {
  return (
    <Row as="header">
      <Col>
        <h1>BList</h1>
      </Col>
    </Row>
  )
}
function BooksRow({ children }: { children: React.ReactNode }) {
  return (
    <Row as="main" className="flex-grow-1">
      <Col>{children}</Col>
    </Row>
  )
}
function Books({ bookData, loading }: { bookData: Book[]; loading: boolean }) {
  if (loading) {
    return (
      <BooksRow>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </BooksRow>
    )
  }

  if (!bookData.length) {
    return (
      <BooksRow>
        <h2>No books to show</h2>
      </BooksRow>
    )
  }
  return (
    <Row as="main" className="flex-grow-1">
      <Col>
        {JSON.stringify(
          bookData.map(({ book_title }) => book_title),
          null,
          2,
        )}
      </Col>
    </Row>
  )
}
function PageButtons({
  prevEnabled = false,
  nextEnabled = false,
}: {
  prevEnabled: boolean
  nextEnabled: boolean
}) {
  return (
    <Row>
      <Col>
        <ButtonGroup>
          <Button disabled={!prevEnabled}>Prev</Button>
          <Button disabled={!nextEnabled}>Next</Button>
        </ButtonGroup>
      </Col>
    </Row>
  )
}

// hook to parse query string
function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function parsePageNumber(queryValue: string | null) {
  const result = Number.parseInt(queryValue || "", 10)
  if (isNaN(result)) {
    return 1
  }
  return result
}

function calculateLastPage(count: number, itemsPerPage: number) {
  return Math.ceil(count / itemsPerPage)
}

function BookList() {
  const [bookData, setBookData] = useState<Book[]>([])
  const [itemsPerPage] = useState(20)
  const [loading, setLoading] = useState(true)
  const query = useQuery()

  const pageNumber = parsePageNumber(query.get("page"))
  const searchTerm = query.get("search")

  const [lastPage, setLastPage] = useState(pageNumber)

  useEffect(() => {
    setLoading(true)
    ;(async function requestBooksToRender() {
      const data = await postBooks({ pageNumber, itemsPerPage, searchTerm })
      setBookData(data.books)
      setLastPage(calculateLastPage(data.count, itemsPerPage))
      setLoading(false)
    })()
  }, [pageNumber, searchTerm, itemsPerPage])

  return (
    <Container className="d-flex flex-column min-vh-100">
      <Header />
      <Books loading={loading} bookData={bookData} />
      <PageButtons
        nextEnabled={!!bookData.length && pageNumber < lastPage}
        prevEnabled={!!bookData.length && pageNumber > 1}
      />
    </Container>
  )
}

export default BookList
