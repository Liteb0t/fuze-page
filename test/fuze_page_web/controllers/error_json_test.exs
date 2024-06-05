defmodule FuzePageWeb.ErrorJSONTest do
  use FuzePageWeb.ConnCase, async: true

  test "renders 404" do
    assert FuzePageWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{detail: "Not Found"}}
  end

  test "renders 500" do
    assert FuzePageWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{detail: "Internal Server Error"}}
  end
end
