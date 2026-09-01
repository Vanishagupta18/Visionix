"""
Small helpers carried over from the original CSRNet-pytorch repo.
Not required for inference-only use, but kept so `model.py`'s import
doesn't break if you later add training/fine-tuning code.
"""

import h5py
import torch


def save_net(fname, net):
    with h5py.File(fname, 'w') as h5f:
        for k, v in net.state_dict().items():
            h5f.create_dataset(k, data=v.cpu().numpy())


def load_net(fname, net):
    with h5py.File(fname, 'r') as h5f:
        for k, v in net.state_dict().items():
            param = torch.from_numpy(h5f[k][:])
            v.copy_(param)
