## Quick Start 

```
conda create -n legalease python=3.10 pytorch::pytorch
conda activate legalease
pip install --no-cache-dir datasets peft accelerate optimum transformers
pip install --no-cache-dir gptqmodel --no-build-isolation
```

```
conda create -n torchtune conda-forge::python=3.11 pytorch::pytorch
conda activate torchtune
pip install torchao torchtune sympy==1.13.1
```
