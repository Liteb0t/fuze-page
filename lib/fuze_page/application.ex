defmodule FuzePage.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      FuzePageWeb.Telemetry,
      FuzePage.Repo,
      {DNSCluster, query: Application.get_env(:fuze_page, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: FuzePage.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: FuzePage.Finch},
      # Start a worker by calling: FuzePage.Worker.start_link(arg)
      # {FuzePage.Worker, arg},
      # Start to serve requests, typically the last entry
      FuzePageWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: FuzePage.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    FuzePageWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
