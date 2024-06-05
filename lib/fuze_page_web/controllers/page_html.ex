defmodule FuzePageWeb.PageHTML do
  @moduledoc """
  This module contains pages rendered by PageController.

  See the `page_html` directory for all templates available.
  """
  use FuzePageWeb, :html

  # assigns.page_title = "Test"
  # :page_title = "Test"

  def bindex(assigns) do
    ~H"""
    MEDiC!
    """
  end

  embed_templates "page_html/*"
end
