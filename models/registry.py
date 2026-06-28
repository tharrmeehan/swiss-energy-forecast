"""
Promote the best MLflow run per target to Production in the Model Registry.

Expects each training run to:
  - Be tagged with  tags.target = "demand_mw" | "solar_mw" | "wind_mw"
  - Log metric      val_rmse
  - Log the MapieRegressor artifact at path "model"
    (i.e. mlflow.sklearn.log_model(mapie, "model") inside the training run)

Usage:
    python -m models.registry
"""
import os
import mlflow
from mlflow.tracking import MlflowClient
from dotenv import load_dotenv
load_dotenv()

EXPERIMENT = "swiss-energy-forecast"
TARGETS = ["demand_mw", "solar_mw", "wind_mw"]


def promote_best() -> None:
    mlflow.set_tracking_uri(os.environ.get("MLFLOW_TRACKING_URI", "http://localhost:5000"))
    client = MlflowClient()

    exp = client.get_experiment_by_name(EXPERIMENT)
    if exp is None:
        raise ValueError(f"Experiment '{EXPERIMENT}' not found, run training first")

    for target in TARGETS:
        model_name = target.replace("_mw", "") + "-lgbm"

        runs = client.search_runs(
            experiment_ids=[exp.experiment_id],
            filter_string=f"tags.target = '{target}' AND tags.model_logged = 'true'",
            order_by=["metrics.val_rmse ASC"],
            max_results=1,
        )
        if not runs:
            print(f"[registry] no runs for {target}, skipping")
            continue

        best = runs[0]
        mv = mlflow.register_model(f"runs:/{best.info.run_id}/model", model_name)
        # MLflow 3 removed registry stages; the "champion" alias replaces Production
        client.set_registered_model_alias(model_name, "champion", mv.version)
        rmse = best.data.metrics.get("val_rmse", "?")
        print(f"[registry] {model_name} v{mv.version} → @champion  (run {best.info.run_id[:8]}, val_rmse={rmse:.1f})")


if __name__ == "__main__":
    promote_best()
