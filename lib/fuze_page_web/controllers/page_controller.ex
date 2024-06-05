defmodule FuzePageWeb.PageController do
  use FuzePageWeb, :controller

  def index(conn, _params) do
    render(conn, :index, title: "Home")
  end

  def software(conn, _params) do
    render(conn, :software, title: "Software")
  end

  def home(conn, _params) do
    # The home page is often custom made,
    # so skip the default app layout.
    render(conn, :home, layout: false)
  end
end
