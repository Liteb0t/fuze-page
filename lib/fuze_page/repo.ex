defmodule FuzePage.Repo do
  use Ecto.Repo,
    otp_app: :fuze_page,
    adapter: Ecto.Adapters.Postgres
end
